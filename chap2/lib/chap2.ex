defmodule Chap2 do
  use Application

  def start(_type, _args) do
    children = [
      {Plug.Cowboy, scheme: :http, plug: MyPlug, options: [port: 4001]}
    ]
    opts = [strategy: :one_for_one, name: MyApp.Supervisor]
    Supervisor.start_link(children, opts)
    Process.sleep :infinity
  end

end
