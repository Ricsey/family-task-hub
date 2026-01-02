import { useTasks } from "../hooks/useTasks"
import TaskCard from "./TaskCard"

const TasksGrid = () => {
  const {data: tasks} = useTasks()

  return (
    <div className="flex flex-col gap-4">
      {tasks?.map((task) => <TaskCard task={task}/>)}
    </div>
  )
}

export default TasksGrid
