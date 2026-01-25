import type { Task } from "../types"
import TaskCard from "./TaskCard"

interface TasksGridProps {
  tasks: Task[]
}

const TasksGrid = ({tasks}: TasksGridProps) => {
  return (
    <div className="flex flex-col gap-4">
      {tasks?.map((task) => <TaskCard key={task.id} task={task}/>)}
    </div>
  )
}

export default TasksGrid
