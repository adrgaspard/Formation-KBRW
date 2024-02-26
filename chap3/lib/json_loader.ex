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
end
