import nodeCron from "node-cron"

export type Task = {
    cron: string,
    run: () => Promise<void>
}

export const startTask = async (task: Task) => {
    nodeCron.schedule(task.cron, async () => {
        try {
            await task.run();
        } catch(e) {
            console.error(e);
        }
    })
}