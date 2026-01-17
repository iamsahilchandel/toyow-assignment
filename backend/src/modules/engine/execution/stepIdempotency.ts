import { sha256, stableStringify } from '../../../shared/crypto';
import { prismaClient } from '../../../prisma/client';
import { NodeStatus } from '../../../../generated/prisma';

/**
 * Generate idempotency checksum for a step execution
 * checksum = sha256(runId + nodeId + normalizedInputs + pluginVersionId)
 */
export function generateChecksum(
  runId: string,
  nodeId: string,
  input: Record<string, any>,
  pluginVersionId?: string
): string {
  const data = stableStringify({
    runId,
    nodeId,
    input,
    pluginVersionId: pluginVersionId || 'builtin',
  });

  return sha256(data);
}

/**
 * Check if a step execution already exists with SUCCESS status and matching checksum
 */
export async function checkIdempotency(
  runId: string,
  nodeId: string,
  checksum: string
): Promise<{ isIdempotent: boolean; outputs?: Record<string, any> }> {
  const existingStep = await prismaClient.stepExecution.findFirst({
    where: {
      runId,
      nodeId,
      status: NodeStatus.SUCCESS,
    },
  });

  if (!existingStep) {
    return { isIdempotent: false };
  }

  // Compare checksums - if they match, we can skip re-execution
  // Note: checksum field may need to be added to the schema
  const existingChecksum = (existingStep as any).checksum;

  if (existingChecksum === checksum) {
    return {
      isIdempotent: true,
      outputs: (existingStep.output as Record<string, any>) || {},
    };
  }

  return { isIdempotent: false };
}

/**
 * Update step with checksum after execution
 */
export async function updateStepChecksum(stepId: string, checksum: string): Promise<void> {
  // This will work once the schema is updated with checksum field
  try {
    await prismaClient.stepExecution.update({
      where: { id: stepId },
      data: {
        // checksum field will be available after schema migration
        executionKey: checksum, // Use executionKey as checksum for now
      },
    });
  } catch (error) {
    // Silently fail if checksum field doesn't exist yet
  }
}
