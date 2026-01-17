import { Request, Response, NextFunction } from 'express';
import { runsService } from './runs.service';

/**
 * Runs controller - handles HTTP request/response logic
 */
export class RunsController {
  /**
   * Trigger workflow execution
   * POST /workflows/:workflowId/runs
   */
  async trigger(req: Request, res: Response, next: NextFunction) {
    try {
      const run = await runsService.triggerExecution(
        req.params.workflowId,
        req.user!.userId,
        req.user!.role,
        req.body?.input
      );

      res.status(201).json({
        success: true,
        data: { run },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * List executions
   * GET /runs
   */
  async list(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await runsService.listExecutions(
        req.user!.userId,
        req.user!.role,
        req.query as any
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get execution by ID
   * GET /runs/:runId
   */
  async get(req: Request, res: Response, next: NextFunction) {
    try {
      const run = await runsService.getExecution(
        req.params.runId,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: { run },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Pause execution
   * POST /runs/:runId/pause
   */
  async pause(req: Request, res: Response, next: NextFunction) {
    try {
      await runsService.pauseExecution(req.params.runId, req.user!.userId, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Execution paused successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Resume execution
   * POST /runs/:runId/resume
   */
  async resume(req: Request, res: Response, next: NextFunction) {
    try {
      await runsService.resumeExecution(req.params.runId, req.user!.userId, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Execution resumed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel execution
   * POST /runs/:runId/cancel
   */
  async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      await runsService.cancelExecution(req.params.runId, req.user!.userId, req.user!.role);

      res.status(200).json({
        success: true,
        message: 'Execution cancelled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get step executions
   * GET /runs/:runId/steps
   */
  async getSteps(req: Request, res: Response, next: NextFunction) {
    try {
      const steps = await runsService.getStepExecutions(
        req.params.runId,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: { steps },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get specific step
   * GET /runs/:runId/steps/:nodeId
   */
  async getStep(req: Request, res: Response, next: NextFunction) {
    try {
      const step = await runsService.getStep(
        req.params.runId,
        req.params.nodeId,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        data: { step },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retry step
   * POST /runs/:runId/steps/:nodeId/retry
   */
  async retryStep(req: Request, res: Response, next: NextFunction) {
    try {
      await runsService.retryStep(
        req.params.runId,
        req.params.nodeId,
        req.user!.userId,
        req.user!.role
      );

      res.status(200).json({
        success: true,
        message: 'Step retry initiated',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get logs
   * GET /runs/:runId/logs
   */
  async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const logs = await runsService.getLogs(
        req.params.runId,
        req.user!.userId,
        req.user!.role,
        req.query as any
      );

      res.status(200).json({
        success: true,
        data: { logs },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Stream logs as NDJSON
   * GET /runs/:runId/logs/stream
   */
  async streamLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const entries = await runsService.getLogsForStream(
        req.params.runId,
        req.user!.userId,
        req.user!.role
      );

      // Set NDJSON content type
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Transfer-Encoding', 'chunked');

      // Stream each entry as a line
      for (const entry of entries) {
        res.write(JSON.stringify(entry) + '\n');
      }

      res.end();
    } catch (error) {
      next(error);
    }
  }
}

export const runsController = new RunsController();
