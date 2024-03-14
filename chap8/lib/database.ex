defmodule Database do
  use GenServer;

  def start_link(initial_value) do
    GenServer.start_link(__MODULE__, initial_value, name: initial_value[:name])
  end

  @impl true
  def init(args) do
    id = case args[:name] do
      tmp when is_atom(tmp) -> tmp
      tmp -> :"#{tmp}"
    end
    :ets.new(id, [:named_table])
    {:ok, id}
  end

  @impl true
  def handle_call(object, _from, intern_state) do
    response = execute_method(intern_state, object)
    {:reply, response, intern_state}
  end

  @impl true
  def handle_cast(object, intern_state) do
    execute_method(intern_state, object)
    {:noreply, intern_state}
  end

  # Not a good practice: must cleanup with monitors
  # @impl true
  # def terminate(_, _) do
  #   :ets.delete(:database_ets)
  # end

  def get(database \\ :db_default, key) when is_atom(database) when not is_list(key) do GenServer.call(database, {:get, key}) end

  def post(database \\ :db_default, key, value) when is_atom(database) do GenServer.call(database, {:post, {key, value}}) end

  def put(database \\ :db_default, key, value) when is_atom(database)  do GenServer.call(database, {:put, {key, value}}) end

  def delete(database \\ :db_default, key) when is_atom(database) do GenServer.call(database, {:delete, key}) end

  def search(database \\ :db_default, criterias) when is_atom(database) when is_list(criterias) do GenServer.call(database, {:get, criterias}) end

  defp execute_method(database, {:get, key}) when not is_list(key) do
    case :ets.lookup(database, key) do
      [{_key, value}] -> {:ok, value}
      _ -> :not_found
    end
  end

  defp execute_method(database, {:get, criterias}) when is_list(criterias) do
    try do
      :ets.foldl(fn item, acc ->
        data = elem(item, 1)
        if Enum.empty?(criterias) or Enum.any?(criterias, fn {key, value} -> data[key] == value end), do: [item | acc], else: acc
      end, [], database)
    rescue
      _error -> :wrong_format
    end
  end

  defp execute_method(database, {:post, {key, value}}) do
    case :ets.lookup(database, key) do
      [{_key, _value}] -> :already_exists
      _ ->
        :ets.insert_new(database, {key, value})
        {:created, value}
    end
  end

  defp execute_method(database, {:put, {key, value}}) do
    case :ets.lookup(database, key) do
      [{_key, _old_value}] ->
        :ets.insert(database, {key, value})
        {:updated, value}
      _ -> :not_found
    end
  end

  defp execute_method(database, {:delete, key}) do
    case :ets.lookup(database, key) do
      [{key, _value}] ->
        :ets.delete(database, key)
        :deleted
      _ -> :not_found
    end
  end

  defp execute_method(_database, {_method, _content}) do :bad_method end

  defp execute_method(_database, _obj) do :bad_request end
end
