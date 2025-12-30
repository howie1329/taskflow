import crypto from "crypto";

/**
 * Artifact status types
 */
export const ArtifactStatus = {
  PENDING: "pending",
  LOADING: "loading",
  COMPLETE: "complete",
  ERROR: "error",
};

/**
 * Creates a standardized artifact data structure
 */
export const createArtifactData = ({
  status,
  toolName,
  provider = null,
  message,
  input,
  outputs = null,
  error = null,
  duration = null,
}) => ({
  status,
  toolName,
  provider,
  message,
  input,
  outputs,
  error,
  timestamp: new Date().toISOString(),
  ...(duration !== null && { duration }),
});

/**
 * Artifact Writer - wraps writer.write with artifact formatting
 */
export class ArtifactWriter {
  constructor(writer, toolName, artifactsCollector, provider = null) {
    this.writer = writer;
    this.toolName = toolName;
    this.artifactId = null;
    this.startTime = null;
    this.artifactsCollector = artifactsCollector;
    this.provider = provider || null;
  }

  /**
   * Initialize artifact with pending state
   */
  init(input, message = "Initializing...") {
    this.artifactId = `data-artifact-${this.toolName.toLowerCase()}-${crypto.randomUUID()}`;
    this.startTime = Date.now();

    this.writer.write({
      type: `data-artifact-${this.toolName.toLowerCase()}`,
      id: this.artifactId,
      data: createArtifactData({
        status: ArtifactStatus.PENDING,
        toolName: this.toolName,
        provider: this.provider,
        message,
        input,
      }),
    });

    return this.artifactId;
  }

  /**
   * Update artifact to loading state
   */
  loading(input, message) {
    if (!this.artifactId) {
      this.init(input, message);
      return;
    }

    this.writer.write({
      type: `data-artifact-${this.toolName.toLowerCase()}`,
      id: this.artifactId,
      data: createArtifactData({
        status: ArtifactStatus.LOADING,
        toolName: this.toolName,
        provider: this.provider,
        message,
        input,
      }),
    });
  }

  /**
   * Update artifact to complete state
   */
  complete(input, outputs, message = "Completed successfully") {
    if (!this.artifactId) {
      throw new Error(
        "Artifact not initialized. Call init() or loading() first."
      );
    }

    const duration = this.startTime ? Date.now() - this.startTime : null;

    const artifactData = createArtifactData({
      status: ArtifactStatus.COMPLETE,
      toolName: this.toolName,
      provider: this.provider,
      message,
      input,
      outputs,
      duration,
    });

    this.writer.write({
      type: `data-artifact-${this.toolName.toLowerCase()}`,
      id: this.artifactId,
      data: artifactData,
    });

    // Also append to collector for database persistence
    if (this.artifactsCollector) {
      this.artifactsCollector.push({
        id: this.artifactId,
        ...artifactData,
      });
    }
  }

  /**
   * Update artifact to error state
   */
  error(input, error, message = "Operation failed") {
    if (!this.artifactId) {
      this.init(input, message);
    }

    const duration = this.startTime ? Date.now() - this.startTime : null;
    const errorMessage = error instanceof Error ? error.message : String(error);

    const artifactData = createArtifactData({
      status: ArtifactStatus.ERROR,
      toolName: this.toolName,
      provider: this.provider,
      message,
      input,
      error: errorMessage,
      duration,
    });

    this.writer.write({
      type: `data-artifact-${this.toolName.toLowerCase()}`,
      id: this.artifactId,
      data: artifactData,
    });

    // Also append to collector for database persistence
    if (this.artifactsCollector) {
      this.artifactsCollector.push({
        id: this.artifactId,
        ...artifactData,
      });
    }
  }
}

/**
 * Convenience wrapper for try-catch artifact pattern
 */
export const withArtifact = async (
  writer,
  toolName,
  input,
  artifactsCollector,
  operation,
  provider
) => {
  const artifact = new ArtifactWriter(
    writer,
    toolName,
    artifactsCollector,
    provider
  );
  artifact.init(input);

  try {
    const result = await operation(artifact);
    return result;
  } catch (error) {
    artifact.error(input, error);
    throw error;
  }
};
