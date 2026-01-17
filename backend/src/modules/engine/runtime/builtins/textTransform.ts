import { StepContext } from '../../engine.types';
import { sha256 } from '../../../../shared/crypto';

/**
 * TEXT_TRANSFORM Built-in Plugin
 *
 * Operations:
 * - caesar: Caesar cipher with shift
 * - reverse: Reverse text
 * - sha256: SHA-256 hash
 * - uppercase: Convert to uppercase
 * - lowercase: Convert to lowercase
 */
export async function executeTextTransform(
  context: StepContext
): Promise<{ success: boolean; output?: Record<string, any>; error?: string }> {
  const { config, input } = context;
  const operation = config.operation as string;
  const text = (input.text || config.text || '') as string;

  try {
    let result: string;

    switch (operation) {
      case 'caesar': {
        const shift = (config.shift as number) || 3;
        result = caesarCipher(text, shift);
        break;
      }

      case 'reverse': {
        result = text.split('').reverse().join('');
        break;
      }

      case 'sha256': {
        result = sha256(text);
        break;
      }

      case 'uppercase': {
        result = text.toUpperCase();
        break;
      }

      case 'lowercase': {
        result = text.toLowerCase();
        break;
      }

      default:
        return {
          success: false,
          error: `Unknown TEXT_TRANSFORM operation: ${operation}`,
        };
    }

    return {
      success: true,
      output: {
        text: result,
        originalText: text,
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

/**
 * Caesar cipher implementation
 */
function caesarCipher(text: string, shift: number): string {
  return text
    .split('')
    .map((char) => {
      const code = char.charCodeAt(0);

      // Uppercase letters
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }

      // Lowercase letters
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }

      // Non-alphabetic characters
      return char;
    })
    .join('');
}
