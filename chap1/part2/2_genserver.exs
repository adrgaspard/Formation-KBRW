defmodule Server.Database do
  use GenServer

  def start_link(initial_value) do
    GenServer.start_link(__MODULE__, initial_value, name: __MODULE__)
  end

  def init(_) do
    {:ok, :ok}
  end

  @impl true
  def handle_call(object, _from, intern_state) do
    {:reply, object, intern_state}
  end

  @impl true
  def handle_cast(object, intern_state) do
    {:noreply, intern_state}
  end

end
