defmodule StaticRouter do
  use Plug.Router
  require EEx

  plug(Plug.Logger)
  plug(Plug.Static, from: :myapp, at: "/public")
  plug(:match)
  plug(:dispatch)

  EEx.function_from_file :defp, :layout, "web/layout.html.eex", [:render]

  get _ do
    conn = fetch_query_params(conn)
    render = Reaxt.render!(:app, %{path: conn.request_path, cookies: conn.cookies, query: conn.params}, 30_000)
    send_resp(put_resp_header(conn, "content-type", "text/html;charset=utf-8"), render.param || 200, layout(render))
  end

end
