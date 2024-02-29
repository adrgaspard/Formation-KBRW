defmodule MainRouter do
  use Plug.Router

  plug(:match)
  plug(:dispatch)

  forward "/api", to: RestRouter
  forward "/", to: StaticRouter
end
