defmodule Chap2 do
  use Application
  require Logger

  def start(_type, _args) do
    children = [
      {Plug.Cowboy, scheme: :http, plug: TheFirstPlug, options: [port: 4001]}
    ]
    opts = [strategy: :one_for_one, name: Chap2.Supervisor]
    Supervisor.start_link(children, opts)
    Logger.info("Plug now running on localhost:4001")
    Process.sleep :infinity
  end

end
