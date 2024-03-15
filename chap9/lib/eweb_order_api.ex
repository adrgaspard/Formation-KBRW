defmodule OrderApiUtils do
  def if_whitespace_nil_else_escape(string) do
    case string do
      nil -> nil
      str -> case String.trim(str) do
        "" -> nil
        trimed -> Riak.escape(trimed)
      end
    end
  end

  def parse_body_string(conn) do
    case Plug.Conn.read_body(conn) do
      {:ok, data, _conn} ->
        case Poison.decode(data) do
          {:ok, value} -> {:ok, value}
          {:error, error} -> {:error, error}
        end
      {:error, error} -> {:error, error}
    end
  end
end

defmodule JsonOrderApi do
  use Ewebmachine.Builder.Handlers

  plug :cors
  plug :add_handlers, init: %{}

  content_types_provided do: ["application/json": :to_json]
  defh to_json, do: Poison.encode!(state[:json_obj])

  defp cors(conn,_) do
    put_resp_header(conn,"Access-Control-Allow-Origin","*")
  end
end

defmodule OrderErrorRoutes do
  use Ewebmachine.Builder.Resources

  resources_plugs()

  resource "/error/:status" do %{s: elem(Integer.parse(status),0)} after
    content_types_provided do: ['text/html': :to_html, 'application/json': :to_json]
    defh to_html, do: "<h1> Error ! : '#{Ewebmachine.Core.Utils.http_label(state.s)}'</h1>"
    defh to_json, do: ~s/{"error": #{state.s}, "label": "#{Ewebmachine.Core.Utils.http_label(state.s)}"}/
    finish_request do: {:halt,state.s}
  end
end

defmodule EwebOrderApi do
  use Ewebmachine.Builder.Resources
  import OrderApiUtils

  if Mix.env == :dev, do: plug Ewebmachine.Plug.Debug
  plug JsonOrderApi
  plug :resource_match
  plug Ewebmachine.Plug.Run
  plug Ewebmachine.Plug.Send

  resources_plugs(error_forwarding: "/error/:status", nomatch_404: true)
  plug OrderErrorRoutes

  resource "/orders/" do %{} after
    allowed_methods do: ["GET"]
    resource_exists do
      conn = fetch_query_params(conn)
      page = if_whitespace_nil_else_escape(conn.query_params["page"])
      rows = if_whitespace_nil_else_escape(conn.query_params["rows"])
      sort = if_whitespace_nil_else_escape(conn.query_params["sort"])
      query = conn.query_params
        |> Enum.map(fn
          {key, value} ->
            with clean_key <- key |> String.trim() |> Riak.escape(),
                clean_value <- value && value |> String.trim() |> Riak.escape() do
              {clean_key, clean_value}
            end
        end)
        |> Enum.filter(fn {key, value} ->
          key not in ["", "page", "rows", "sort"] and value not in [nil, ""]
        end)
        |> Enum.map(fn {key, value} -> "#{key}:#{value}" end)
        |> Enum.join(" AND ")
      query =
        URI.encode_www_form(
          case String.length(query) do
            length when length > 0 -> query
            _ -> "*:*"
          end
        )
      {:ok, {_, response}} = Riak.search(Riak.orders_index_name(), query, page, rows, sort)
      data =
        case response["docs"] do
          [] -> %{}
          result -> result
        end
      pass(true, json_obj: data)
    end
  end

  resource "/order/:id/pay" do %{id: id} after
    allowed_methods do: ["GET"]
    resource_exists do
      pid = OrderSupervisor.fetch_child(state.id)
      result = OrderTransitor.pay_order(pid)
      case result do
        :action_unavailable -> {:halt, 400}
        _ -> {:halt, 200}
      end
    end
  end

  resource "/order/:id/verify" do %{id: id} after
    allowed_methods do: ["GET"]
    resource_exists do
      pid = OrderSupervisor.fetch_child(state.id)
      result = OrderTransitor.pay_order(pid)
      case result do
        :action_unavailable -> {:halt, 400}
        _ -> {:halt, 200}
      end
    end
  end

  resource "/order/:id" do %{id: id} after
    allowed_methods do: ["GET", "POST", "PUT", "DELETE"]
    resource_exists do
      order = case Riak.get(Riak.orders_bucket, state.id) do
        {:ok, {_, response}} -> response
        _ -> nil
      end
      case conn.method do
        method when method == "GET" or method == "DELETE" ->
          pass(order !== nil, json_obj: order)
        method when method == "PUT" or method == "POST" ->
          case (order == nil) == (method == "POST") do
            true -> case parse_body_string(conn) do
              {:ok, body} ->
                case body["id"] do
                  id when is_binary(id) ->
                    case Riak.put(Riak.orders_bucket, id, body) do
                      {:ok, _} ->
                        conn = Map.put(conn, :resp_body, body)
                        {{:halt, 201}, conn, nil}
                      _ -> {:halt, 500}
                    end
                  _ -> {:halt, 400}
                end
              {:error, _} -> {:halt, 400}
            end
            _ -> case order == nil do
              true -> {:halt, 404}
              _ -> {:halt, 409}
            end
          end
      end
    end

    delete_resource do
      result = case Riak.delete(Riak.orders_bucket, state.id) do
        {:ok, {_, _}} -> true
        _ -> false
      end
      {result, conn, nil}
    end
  end
end
