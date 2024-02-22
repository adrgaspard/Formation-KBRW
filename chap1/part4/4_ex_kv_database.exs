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

  defp execute_method(object) do
    case object do
      {:get, key} -> get(key)
      {:post, {key, value}} -> post(key, value)
      {:put, {key, value}} -> put(key, value)
      {:delete, key} -> delete(key)
      {method, _} when is_atom(method) -> :bad_method
      _other -> :bad_request
    end
  end

  defp get(key) do
    case :ets.lookup(:database_ets, key) do
      [{_key, value}] -> {:ok, value}
      _ -> :not_found
    end
  end

  defp post(key, value) do
    case :ets.lookup(:database_ets, key) do
      [{_key, _value}] -> :already_exists
      _ ->
        :ets.insert_new(:database_ets, {key, value})
        {:created, value}
    end
  end

  defp put(key, value) do
    case :ets.lookup(:database_ets, key) do
      [{_key, _old_value}] ->
        :ets.insert(:database_ets, {key, value})
        {:updated, value}
      _ -> :not_found
    end
  end

  defp delete(key) do
    case :ets.lookup(:database_ets, key) do
      [{key, _value}] ->
        :ets.delete(:database_ets, key)
        :deleted
      _ -> :not_found
    end
  end

end

defmodule DbSupervisor do
  use Supervisor

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    children = [
      Database
    ]
    Supervisor.init(children, strategy: :one_for_one)
  end
end

children = [
  DbSupervisor
]
Supervisor.start_link(children, strategy: :one_for_one)
:bad_request                    = GenServer.call(Database, "useless because of bad_request")
:bad_method                     = GenServer.call(Database, {:wrong_method, "useless because of bad_method"})
:not_found                      = GenServer.call(Database, {:get, "key1"})
:not_found                      = GenServer.call(Database, {:put, {"key1", "useless because of not_found"}})
:not_found                      = GenServer.call(Database, {:delete, "key1"})
{:created, "my new data yay!"}  = GenServer.call(Database, {:post, {"key1", "my new data yay!"}})
:already_exists                 = GenServer.call(Database, {:post, {"key1", "useless because of already_exists"}})
{:ok, "my new data yay!"}       = GenServer.call(Database, {:get, "key1"})
{:updated, "the data changed!"} = GenServer.call(Database, {:put, {"key1", "the data changed!"}})
{:ok, "the data changed!"}      = GenServer.call(Database, {:get, "key1"})
:deleted                        = GenServer.call(Database, {:delete, "key1"})
:not_found                      = GenServer.call(Database, {:get, "key1"})
:not_found                      = GenServer.call(Database, {:put, {"key1", "useless because of not_found"}})
:not_found                      = GenServer.call(Database, {:delete, "key1"})
{:created, "the data is back!"} = GenServer.call(Database, {:post, {"key1", "the data is back!"}})
