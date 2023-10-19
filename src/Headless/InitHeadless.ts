export default function InitHeadless() {
  // the web game runs in ./dist, so to be able to access the same files, headless should run there too
  process.chdir('./dist');
}
