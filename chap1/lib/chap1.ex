defmodule Chap1 do
  use Application

  def start(_type, _args) do
    children = [
      DbSupervisor
    ]
    pid = Supervisor.start_link(children, strategy: :one_for_one)
    0..1
    |> Enum.map(fn num -> "../../_instructions/Resources/chap1/orders_dump/orders_chunk#{num}.json" end)
    |> Enum.each(fn file -> JsonLoader.load_to_database :db_default, file end)
    pid
  end

end
