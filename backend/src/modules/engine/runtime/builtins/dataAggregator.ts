import { StepContext } from '../../engine.types';

/**
 * DATA_AGGREGATOR Built-in Plugin
 *
 * Operations:
 * - merge: Merge multiple objects
 * - pick: Pick specific fields
 * - omit: Omit specific fields
 * - map: Map over array
 * - filter: Filter array
 * - reduce: Reduce array to single value
 * - flatten: Flatten nested arrays
 */
export async function executeDataAggregator(
  context: StepContext
): Promise<{ success: boolean; output?: Record<string, any>; error?: string }> {
  const { config, input, steps } = context;
  const operation = config.operation as string;

  try {
    let result: any;

    switch (operation) {
      case 'merge': {
        // Merge outputs from specified steps
        const sources = (config.sources as string[]) || [];
        result = {};

        for (const source of sources) {
          if (steps[source]?.outputs) {
            result = { ...result, ...steps[source].outputs };
          }
        }

        // Also merge direct input
        if (input) {
          result = { ...result, ...input };
        }
        break;
      }

      case 'pick': {
        // Pick specific fields
        const fields = (config.fields as string[]) || [];
        const source = input.data || input;
        result = {};

        for (const field of fields) {
          if (source[field] !== undefined) {
            result[field] = source[field];
          }
        }
        break;
      }

      case 'omit': {
        // Omit specific fields
        const fieldsToOmit = new Set((config.fields as string[]) || []);
        const source = input.data || input;
        result = {};

        for (const [key, value] of Object.entries(source)) {
          if (!fieldsToOmit.has(key)) {
            result[key] = value;
          }
        }
        break;
      }

      case 'map': {
        // Map over array with field extraction
        const array = (input.data || input.array || []) as any[];
        const mapField = config.mapField as string;

        if (mapField) {
          result = array.map((item) => item[mapField]);
        } else {
          result = array;
        }
        break;
      }

      case 'filter': {
        // Filter array based on condition
        const array = (input.data || input.array || []) as any[];
        const filterField = config.filterField as string;
        const filterValue = config.filterValue;
        const filterOp = (config.filterOp as string) || 'eq';

        result = array.filter((item) => {
          const value = filterField ? item[filterField] : item;

          switch (filterOp) {
            case 'eq':
              return value === filterValue;
            case 'neq':
              return value !== filterValue;
            case 'gt':
              return value > filterValue;
            case 'gte':
              return value >= filterValue;
            case 'lt':
              return value < filterValue;
            case 'lte':
              return value <= filterValue;
            case 'contains':
              return String(value).includes(String(filterValue));
            case 'exists':
              return value !== undefined && value !== null;
            default:
              return true;
          }
        });
        break;
      }

      case 'reduce': {
        // Reduce array to single value
        const array = (input.data || input.array || []) as any[];
        const reduceField = config.reduceField as string;
        const reduceOp = (config.reduceOp as string) || 'sum';
        const initialValue = config.initialValue ?? 0;

        result = array.reduce((acc, item) => {
          const value = reduceField ? item[reduceField] : item;

          switch (reduceOp) {
            case 'sum':
              return acc + Number(value);
            case 'product':
              return acc * Number(value);
            case 'min':
              return Math.min(acc, Number(value));
            case 'max':
              return Math.max(acc, Number(value));
            case 'concat':
              return String(acc) + String(value);
            case 'count':
              return acc + 1;
            default:
              return acc;
          }
        }, initialValue);
        break;
      }

      case 'flatten': {
        // Flatten nested arrays
        const array = (input.data || input.array || []) as any[];
        const depth = (config.depth as number) || 1;
        result = array.flat(depth);
        break;
      }

      default:
        return {
          success: false,
          error: `Unknown DATA_AGGREGATOR operation: ${operation}`,
        };
    }

    return {
      success: true,
      output: {
        data: result,
        operation,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
    };
  }
}
