defmodule MyApp do
  use Application
  require Logger

  @webserver_port 4002

  def start(_type, _args) do
    children = [
      {Database, [name: :db_default]},
      {Plug.Cowboy, scheme: :http, plug: MainRouter, options: [port: @webserver_port]}
    ]
    opts = [strategy: :one_for_one, name: MyApp.Supervisor]
    Logger.info "Starting web server..."
    pid = Supervisor.start_link(children, opts)
    Logger.info "Starting Reaxt..."
    Application.put_env(:reaxt, :global_config, Map.merge(Application.get_env(:reaxt, :global_config), %{localhost: "http://0.0.0.0:#{@webserver_port}"}))
    Reaxt.reload
    Logger.info "Loading data to ETS..."
    data_files = 0..1
    |> Enum.map(fn num -> "../../_instructions/Resources/chap1/orders_dump/orders_chunk#{num}.json" end)
    Enum.each(data_files, fn file -> JsonLoader.load_to_database(:db_default, file) end)
    Logger.info "Storing Riak schemas and indexes..."
    {:ok, _} = Riak.put_schema(Riak.orders_schema_name, Riak.orders_schema_path)
    {:ok, _} = Riak.put_index(Riak.orders_index_name, Riak.orders_schema_name)
    {:ok, _} = Riak.assign_index(Riak.orders_index_name, Riak.orders_bucket)
    {:ok, _} = Riak.get_schema(Riak.orders_schema_name)
    Logger.info "Loading data to Riak..."
    Enum.each(data_files, fn file -> JsonLoader.load_to_riak(file) end)
    pid
  end
end
