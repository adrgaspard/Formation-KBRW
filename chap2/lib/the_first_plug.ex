defmodule TheFirstPlug do
  import Plug.Conn

  def init(options) do
    options
  end

  def call(conn, _opts) do
    {response_code, response_data} = case {conn.method, conn.request_path} do
      {"GET", "/"} -> {200, "Welcome to the new world of Plugs!"}
      {"GET", "/me"} -> {200, "I am The First, The One, Le Geant Plug Vert, Le Grand Plug, Le Plug Cosmique."}
      _ -> {404, "Go away, you are not welcome here."}
    end
    conn
    |> put_resp_content_type("text/plain")
    |> send_resp(response_code, response_data)
  end
end
