/** Delays the execution for a short period of time in milliseconds. */
export async function delay(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout((): void => {
      resolve(`Delayed for ${milliseconds.toLocaleString()}ms.`);
    }, milliseconds);
  });
}
