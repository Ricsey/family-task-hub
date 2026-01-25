import SummaryCard from "../components/SummaryCard"
import UpcomingTasksCard from "../components/UpcomingTasksCard"

const TasksDashboard = () => {
  return (
    <div className="space-y-4">
      <p className="text-3xl font-bold mb-8">Dashboard</p>
      <SummaryCard />
      <UpcomingTasksCard />
    </div>
  )
}

export default TasksDashboard
