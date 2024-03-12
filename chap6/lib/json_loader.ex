defmodule JsonLoader do
  def load_to_database(database, json_file) do
    case File.read json_file do
      {:ok, content} ->
        try do
          Poison.decode!(content, %{})
          |> Enum.map(fn elem -> {elem["id"], elem} end)
          |> Enum.each(fn elem -> Database.post(database, elem(elem, 0), elem(elem, 1)) end)
        rescue
          error -> {:err, error}
        end
      err -> err
    end
  end

  def load_to_riak(json_file) do
    {:ok, content} = File.read json_file
    objects = Poison.decode!(content, %{}) |> Enum.map(fn elem -> {elem["id"], elem} end)
    task = Task.async_stream(objects, fn object -> Riak.put(Riak.orders_bucket, elem(object, 0), Poison.encode!(elem(object, 1))) end, max_concurrency: 4)
    Stream.run task
  end
end
