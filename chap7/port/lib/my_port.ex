defmodule MyPort do
  use GenServer;

  def start_link() do
    GenServer.start_link(MyPort, {"node hello.js", 0, cd: "../node_sample"}, name: MyPort)
  end

  def hello() do
    GenServer.call(MyPort, :hello)
  end

  def init({cmd, init, opts}) do
    port = Port.open({:spawn, '#{cmd}'}, [:binary, :exit_status, packet: 4] ++ opts)
    send(port, {self(), {:command, :erlang.term_to_binary(init)}})
    {:ok, port}
  end

  def handle_info({port, {:exit_status, 0}}, port), do: {:stop, :normal, port}

  def handle_info({port, {:exit_status, _}}, port), do: {:stop, :port_terminated, port}

  def handle_info(_, port), do: {:noreply, port}

  def handle_call(term, _from, port) do
    send(port, {self(), {:command, :erlang.term_to_binary(term)}})
    response = receive do {^port, {:data, b}} -> :erlang.binary_to_term(b) end
    {:reply, response, port}
  end

  def handle_cast(term, port) do
    send(port, {self(), {:command, :erlang.term_to_binary(term)}})
    {:noreply, port}
  end

end
