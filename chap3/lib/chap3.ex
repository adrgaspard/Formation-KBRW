defmodule Chap3 do
  use Application
  require Logger

  def start(_type, _args) do
    children = [
      {Database, [name: :db_default]},
      {Plug.Cowboy, scheme: :http, plug: RestRouter, options: [port: 4002]}
    ]
    opts = [strategy: :one_for_one, name: Chap3.Supervisor]
    pid = Supervisor.start_link(children, opts)
    Logger.info("Plug now running on localhost:4002")
    0..1
    |> Enum.map(fn num -> "../_instructions/Resources/chap1/orders_dump/orders_chunk#{num}.json" end)
    |> Enum.each(fn file -> JsonLoader.load_to_database :db_default, file end)
    pid
  end
end
