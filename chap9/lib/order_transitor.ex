defmodule OrderTransitor do
  use GenServer, restart: :transient

  @timeout (5 * 60 * 1000)

  def start_link(order_id) do
    GenServer.start_link(__MODULE__, order_id, [])
  end

  @impl true
  def init(order_id) do
    {:ok, elem(elem(Riak.get(Riak.orders_bucket, order_id), 1), 1), @timeout}
  end

  def get_order(pid) do
    GenServer.call pid, :get
  end

  def pay_order(pid) do
    GenServer.call pid, :pay
  end

  def verify_order(pid) do
    GenServer.call pid, :verify
  end

  @impl true
  def handle_call(:get, _from, state) do
    {:reply, state, state, @timeout}
  end

  @impl true
  def handle_call(:pay, _from, state) do
    case ExFSM.Machine.event(state, {:process_payment, []}) do
      {:next_state, updated_order} ->
        {:ok, _} = Riak.put(Riak.orders_bucket, state["id"], updated_order)
        {:reply, updated_order, updated_order, @timeout}
      _ -> {:reply, :action_unavailable, state, @timeout}
    end
  end

  @impl true
  def handle_call(:verify, _from, state) do
    case ExFSM.Machine.event(state, {:verification, []}) do
      {:next_state, updated_order} ->
        {:ok, _} = Riak.put(Riak.orders_bucket, state["id"], updated_order)
        {:reply, updated_order, updated_order, @timeout}
      _ -> {:reply, :action_unavailable, state, @timeout}
    end
  end

  @impl true
  def handle_info(:timeout, _state) do
    {:stop, :shutdown, nil}
  end

end
