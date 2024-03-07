defmodule StaticRouter do
  use Plug.Router

  plug(Plug.Logger)
  plug(Plug.Static, from: "priv/static", at: "/static")
  plug(:match)
  plug(:dispatch)

  get _ do
    send_file(conn, 200, "priv/static/index.html")
  end

end
