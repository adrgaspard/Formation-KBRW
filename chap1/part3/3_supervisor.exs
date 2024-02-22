

defmodule Stack do
  use GenServer

  def start_link(state) do
    GenServer.start_link(__MODULE__, state, name: __MODULE__)
  end

  ## Callbacks

  @impl true
  def init(stack) do
    {:ok, stack}
  end

  @impl true
  def handle_call(:pop, _from, [head | tail]) do
    {:reply, head, tail}
  end

  @impl true
  def handle_cast({:push, head}, tail) do
    {:noreply, [head | tail]}
  end

  def child_spec(arg) do
    %{
      id: Stack,
      start: {Stack, :start_link, [arg]}
    }
  end
end

defmodule MyApp.Supervisor do
  # Automatically defines child_spec/1
  use Supervisor

  def start_link(init_arg) do
    Supervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    children = [
      {Stack}
    ]
    Supervisor.init(children, strategy: :one_for_one)
  end
end
