export async function fakeAPI(pageNum: string) {
  await new Promise((res) => setTimeout(res, 2000));
  return `Data for page ${pageNum}`;
}
