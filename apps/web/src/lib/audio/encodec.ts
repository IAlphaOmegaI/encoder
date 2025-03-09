// @ts-ignore, issues with onnxruntime-web
import * as ort from "onnxruntime-web";

// Configure ONNX Runtime
ort.env.wasm.numThreads = 4;
ort.env.wasm.simd = true;

export class EncodecProcessor {
    private session: ort.InferenceSession | null = null;

    async initialize() {
        if (this.session) return;

        try {
            // Initialize ONNX Runtime session
            this.session = await ort.InferenceSession.create('/models/encodec_24khz.onnx', {
                executionProviders: ['wasm'],
                graphOptimizationLevel: 'all'
            });
            console.log('EnCodec model initialized');
        } catch (error) {
            console.error('Failed to initialize EnCodec model:', error);
            throw error;
        }
    }

    async encode(audioData: Float32Array): Promise<Float32Array> {
        if (!this.session) {
            throw new Error('EnCodec model not initialized');
        }

        // Prepare input tensor - reshape to [1, 1, N] as required by EnCodec
        const tensor = new ort.Tensor(
            'float32',
            audioData,
            [1, 1, audioData.length]
        );

        // Run inference
        const feeds = { input: tensor };
        const results = await this.session.run(feeds);

        // Get the encoded output (8xN matrix)
        const encoded = results.encoded_frames.data as Float32Array;
        console.log('Encoded shape:', results.encoded_frames.dims);

        return encoded;
    }
}