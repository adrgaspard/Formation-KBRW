defmodule RestRouter do
  use Plug.Router

  plug(Plug.Logger)
  plug(:set_content_type_header)
  plug(:match)
  plug(:dispatch)

  get "/orders/" do
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
    send_resp(conn, 200, to_json_response(data))
  end

  get "/order/:id" do
    case Riak.get(Riak.orders_bucket, id) do
      {:ok, {_, response}} -> send_resp(conn, 200, to_json_response(response))
      _ -> send_page_not_found(conn)
    end
  end

  post "/order" do
    case parse_body_string(conn) do
      {:ok, body} ->
        case body["id"] do
          id when is_binary(id) ->
            case Riak.put(Riak.orders_bucket, id, body) do
              {:ok, {_, response}} -> send_resp(conn, 201, to_json_response(response))
              _ -> send_page_not_found(conn)
            end
          _ -> send_bad_request(conn)
        end
      {:error, _} -> send_bad_request(conn)
    end
  end

  put "/order/:id" do
    case parse_body_string(conn) do
      {:ok, body} ->
        case body["id"] do
          body_id when is_binary(body_id) and id == body_id ->
            case Database.put(id, body) do
              {:ok, {_, response}} -> send_resp(conn, 200, to_json_response(response))
              _ -> send_page_not_found(conn)
            end
          _ -> send_bad_request(conn)
        end
      {:error, _} -> send_bad_request(conn)
    end
  end

  delete "/order/:id" do
    case Riak.delete(Riak.orders_bucket, id) do
      {:ok, {_, _}} -> send_resp(conn, 204, "")
      _ -> send_page_not_found(conn)
    end
  end

  match _ do
    send_page_not_found(conn)
  end

  defp set_content_type_header(conn, _opts) do
    put_resp_header(conn, "content-type", "application/json")
  end

  defp to_json_error(error) do
    Poison.encode!(%{"error" => error})
  end

  defp to_json_response(data) do
    Poison.encode!(data)
  end

  defp send_page_not_found(conn) do
    send_resp(conn, 404, to_json_error("Page Not Found"))
  end

  defp send_bad_request(conn) do
    send_resp(conn, 400, to_json_error("Bad Request"))
  end

  defp parse_body_string(conn) do
    case Plug.Conn.read_body(conn) do
      {:ok, data, _conn} ->
        case Poison.decode(data) do
          {:ok, value} -> {:ok, value}
          {:error, error} -> {:error, error}
        end
      {:error, error} -> {:error, error}
    end
  end

  defp if_whitespace_nil_else_escape(string) do
    case string do
      nil -> nil
      str -> case String.trim(str) do
        "" -> nil
        trimed -> Riak.escape(trimed)
      end
    end
  end

end
