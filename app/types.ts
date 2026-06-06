export type Priority = 'must' | 'nice'
export type TaskList = 'inbox' | 'today'

export type Task = {
  id: string
  title: string
  done: boolean
  dueDate?: string
  priority?: Priority
  duration?: string
  labels?: string[]
  subtasks?: Task[]
  createdAt: string
  list: TaskList
}
