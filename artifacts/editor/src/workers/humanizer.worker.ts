import {
  AutoProcessor,
  Qwen3_5ForConditionalGeneration,
  Tensor,
} from "@huggingface/transformers";

const modelId = "onnx-community/Qwen3.5-2B-ONNX";
let processorPromise: ReturnType<typeof AutoProcessor.from_pretrained> | null =
  null;
let modelPromise: ReturnType<
  typeof Qwen3_5ForConditionalGeneration.from_pretrained
> | null = null;

type Request = { id: string; prompt: string; instructions: string };

function progress(update: unknown) {
  self.postMessage({ type: "progress", update });
}

async function load() {
  processorPromise ??= AutoProcessor.from_pretrained(modelId, {
    progress_callback: progress,
  });
  modelPromise ??= Qwen3_5ForConditionalGeneration.from_pretrained(modelId, {
    dtype: {
      embed_tokens: "q4",
      vision_encoder: "fp16",
      decoder_model_merged: "q4",
    },
    device: "webgpu",
    progress_callback: progress,
  });
  return Promise.all([processorPromise, modelPromise]);
}

self.onmessage = async (event: MessageEvent<Request>) => {
  const { id, prompt, instructions } = event.data;
  try {
    const [processor, model] = await load();
    self.postMessage({ type: "generating", id });
    const conversation = [
      { role: "system", content: [{ type: "text", text: instructions }] },
      { role: "user", content: [{ type: "text", text: prompt }] },
    ];
    const text = processor.apply_chat_template(conversation, {
      add_generation_prompt: true,
    });
    const inputs = await processor(text);
    const outputs = await model.generate({
      ...inputs,
      max_new_tokens: 2048,
      do_sample: false,
    });
    const promptLength = inputs.input_ids.dims.at(-1) ?? 0;
    const decoded = processor.batch_decode(
      (outputs as Tensor).slice(null, [promptLength, null]),
      { skip_special_tokens: true },
    );
    self.postMessage({ type: "result", id, result: decoded[0]?.trim() ?? "" });
  } catch (error) {
    self.postMessage({
      type: "error",
      id,
      error: error instanceof Error ? error.message : "Browser model failed",
    });
  }
};
