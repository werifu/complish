import { spawn } from 'child_process';
import { writeFileSync } from 'fs';
const programName = './samples/rust/sub_cmd/target/debug/sub_cmd';

const args = ['-h'];

const child = spawn(programName, args);

child.stdout.on('data', (data) => {
  writeFileSync('./report.txt', data);
  console.log(`${data}`);
});

child.stderr.on('data', (data) => {
  console.error(`stderr: ${data}`);
});

child.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
