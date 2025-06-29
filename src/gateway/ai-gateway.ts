import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';

interface ToolConfig {
  [key: string]: { address: string };
}

const TOOL_CONFIG: ToolConfig = {
  tool1: { address: 'localhost:50051' },
  tool2: { address: 'localhost:50052' },
};

const PROTO_PATH = __dirname + '/../../proto/tool.proto';

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
// TODO: Add proper types for protoDescriptor and AITool
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as unknown as {
  AITool: unknown;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AITool = protoDescriptor.AITool as any;

type ProcessMessageResponse = { response: string };

export async function callAITool(toolId: string, message: string, userId: string): Promise<string> {
  const tool = TOOL_CONFIG[toolId];
  if (!tool) throw new Error('Unknown tool');
  const client = new AITool(tool.address, grpc.credentials.createInsecure());
  return new Promise((resolve, reject) => {
    client.ProcessMessage(
      { message, user_id: userId },
      (err: grpc.ServiceError | null, response: ProcessMessageResponse) => {
        if (err) return reject(err);
        resolve(response.response);
      }
    );
  });
} 