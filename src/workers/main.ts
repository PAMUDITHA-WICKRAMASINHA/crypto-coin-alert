import { Worker } from 'worker_threads';

export function runWorker(number: number) {

const worker = new Worker('./src/workers/worker.js', { 
workerData: {
    value: number,
    path: './worker.ts'
  }
});

worker.on('message', (result) => {
    console.log(result);
});

worker.on('error', function (error) {
   worker.terminate();
});

worker.on('exit', (code) => {
   if (code !== 0)
      worker.terminate();
   });
   return worker;
}