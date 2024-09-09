import { RouterProvider } from "react-router-dom"
import { router } from "./presentation/router/router"

const Portal = () => {
  return (
    <RouterProvider router={ router } />
  )
}

export default Portal