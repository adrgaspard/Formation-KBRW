defmodule OrderSupervisor do
  use DynamicSupervisor

  def start_link(init_arg) do
    DynamicSupervisor.start_link(__MODULE__, init_arg, name: __MODULE__)
  end

  @impl true
  def init(_init_arg) do
    DynamicSupervisor.init(strategy: :one_for_one)
  end

  def fetch_child(order_id) do
    case DynamicSupervisor.which_children(__MODULE__)
    |> Enum.find(fn children -> OrderTransitor.get_order(elem(children, 1))["id"] == order_id end)
    do
      nil -> elem(OrderSupervisor.start_child(order_id), 1)
      found -> elem(found, 1)
    end
  end

  def start_child(order_id) do
    DynamicSupervisor.start_child(__MODULE__, {OrderTransitor, order_id})
  end

end
