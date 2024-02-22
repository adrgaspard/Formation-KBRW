defmodule Database do
  use GenServer;

  def start_link(initial_value) do
    GenServer.start_link(__MODULE__, initial_value, name: __MODULE__)
  end

  @impl true
  def init(_) do
    :ets.new(:database_ets, [:named_table])
    {:ok, :ok}
  end

  @impl true
  def handle_call(object, _from, intern_state) do
    response = execute_method(object)
    {:reply, response, intern_state}
  end

  @impl true
  def handle_cast(object, intern_state) do
    execute_method(object)
    {:noreply, intern_state}
  end

  # Not a good practice: must cleanup with monitors
  # @impl true
  # def terminate(_, _) do
  #   :ets.delete(:database_ets)
  # end

  def get(key) do GenServer.call(__MODULE__, {:get, key}) end

  def post(key, value) do GenServer.call(__MODULE__, {:post, {key, value}}) end

  def put(key, value) do GenServer.call(__MODULE__, {:put, {key, value}}) end

  def delete(key) do GenServer.call(__MODULE__, {:delete, key}) end

  defp execute_method({:get, key}) do
    case :ets.lookup(:database_ets, key) do
      [{_key, value}] -> {:ok, value}
      _ -> :not_found
    end
  end

  defp execute_method({:post, {key, value}}) do
    case :ets.lookup(:database_ets, key) do
      [{_key, _value}] -> :already_exists
      _ ->
        :ets.insert_new(:database_ets, {key, value})
        {:created, value}
    end
  end

  defp execute_method({:put, {key, value}}) do
    case :ets.lookup(:database_ets, key) do
      [{_key, _old_value}] ->
        :ets.insert(:database_ets, {key, value})
        {:updated, value}
      _ -> :not_found
    end
  end

  defp execute_method({:delete, key}) do
    case :ets.lookup(:database_ets, key) do
      [{key, _value}] ->
        :ets.delete(:database_ets, key)
        :deleted
      _ -> :not_found
    end
  end

  defp execute_method({method, _content}) when is_atom(method) do :bad_method end

  defp execute_method(_obj) do :bad_request end

end
