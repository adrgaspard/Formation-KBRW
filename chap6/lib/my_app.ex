defmodule MyApp do
  use Application
  require Logger

  def start(_type, _args) do
    children = [
      {Database, [name: :db_default]},
      {Plug.Cowboy, scheme: :http, plug: MainRouter, options: [port: 4002]}
    ]
    opts = [strategy: :one_for_one, name: MyApp.Supervisor]
    pid = Supervisor.start_link(children, opts)
    Logger.info("Plug now running on localhost:4002")
    0..1
    |> Enum.map(fn num -> "../_instructions/Resources/chap1/orders_dump/orders_chunk#{num}.json" end)
    |> Enum.each(fn file -> JsonLoader.load_to_database :db_default, file end)
    {:ok, _} = Riak.put_schema(Riak.orders_schema_name, Riak.orders_schema_path)
    {:ok, _} = Riak.put_index(Riak.orders_index_name, Riak.orders_schema_name)
    {:ok, _} = Riak.assign_index(Riak.orders_index_name, Riak.orders_bucket)
    {:ok, {_, body}} = Riak.get_schema(Riak.orders_schema_name)
    IO.inspect body
    pid
  end
end
