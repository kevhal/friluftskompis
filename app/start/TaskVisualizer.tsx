"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type Task = {
  id: number;
  title: string;
  status: "running" | "done" | "exiting";
  duration: number;
};

export default function TaskVisualizer({ running }: { running: boolean }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const schedule = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  const startTasks = useCallback(() => {
    const randomDuration = () => 2000 + Math.random() * 4000;

    const fakeTasks: { title: string; delay: number }[] = [
      { title: "Henter Instagram profil", delay: 0 },
      { title: "Sjekker google calendar", delay: 600 },
      { title: "Henter kontaktliste", delay: 1200 },
      { title: "Analyserer instagram likes", delay: 2800 },
      { title: "Analyserer meldinger", delay: 3600 },
    ];

    fakeTasks.forEach(({ title, delay }, i) => {
      schedule(() => {
        const duration = randomDuration();

        setTasks((prev) => [
          ...prev,
          { id: i, title, status: "running", duration },
        ]);

        // Mark done after random duration
        schedule(() => {
          setTasks((prev) =>
            prev.map((t) => (t.id === i ? { ...t, status: "done" } : t))
          );

          // Start exit animation, then remove
          schedule(() => {
            setTasks((prev) =>
              prev.map((t) => (t.id === i ? { ...t, status: "exiting" } : t))
            );
          }, 100);
        }, duration);
      }, delay);
    });
  }, []);

  useEffect(() => {
    if (running) {
      startTasks();
    }
    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [running, startTasks]);

  return (
    <div className="flex flex-col items-center gap-1 w-full pt-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`
            py-1 text-sm text-[#888]
            ${task.status === "running" ? "animate-task-enter animate-task-pulse" : ""}
            ${task.status === "exiting" ? "animate-task-exit" : ""}
          `}
          onAnimationEnd={(e) => {
            if (e.animationName === "taskExit") {
              setTasks((prev) => prev.filter((t) => t.id !== task.id));
            }
          }}
        >
          <span className="flex items-center gap-2">
            <span className={`inline-block h-1.5 w-1.5 rounded-full bg-[#5aad6a] ${task.status === "running" ? "animate-task-dot" : "opacity-0"}`} />
            {task.title}
          </span>
        </div>
      ))}
    </div>
  );
}
