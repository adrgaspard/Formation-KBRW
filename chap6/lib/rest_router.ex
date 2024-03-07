defmodule RestRouter do
  use Plug.Router

  plug(Plug.Logger)
  plug(:set_content_type_header)
  plug(:match)
  plug(:dispatch)

  get "/orders/" do
    case Database.search([]) |> Enum.map(fn {_, value} -> value end) do
      :wrong_format -> send_bad_request(conn)
      data -> send_resp(conn, 200, to_json_response(data))
    end
  end

  get "/orders/search" do
    conn = fetch_query_params(conn)
    criterias = conn.params |> Map.to_list()
    IO.inspect criterias
    case Database.search(criterias) |> Enum.map(fn {_, value} -> value end) do
      :wrong_format -> send_bad_request(conn)
      data -> send_resp(conn, 200, to_json_response(data))
    end
  end

  get "/order/:id" do
    case Database.get(id) do
      {:ok, data} -> send_resp(conn, 200, to_json_response(data))
      :not_found -> send_page_not_found(conn)
    end
  end

  post "/order" do
    case parse_body_string(conn) do
      {:ok, body} ->
        case body["id"] do
          id when is_binary(id) ->
            case Database.post(id, body) do
              {:created, result} -> send_resp(conn, 201, to_json_response(result))
              :already_exists -> send_conflict(conn)
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
              {:updated, result} -> send_resp(conn, 200, to_json_response(result))
              :not_found -> send_page_not_found(conn)
            end
          _ -> send_bad_request(conn)
        end
      {:error, _} -> send_bad_request(conn)
    end
  end

  delete "/order/:id" do
    case Database.delete(id) do
      :deleted ->
        send_resp(conn, 204, "")
      :not_found -> send_page_not_found(conn)
    end
  end

  match _ do
    send_page_not_found(conn)
  end

  defp set_content_type_header(conn, _opts) do
    put_resp_header(conn, "content-type", "application/json")
  end

  defp to_json_error(error) do Poison.encode!(%{"error" => error}) end

  defp to_json_response(data) do Poison.encode!(data) end

  defp send_page_not_found(conn) do send_resp(conn, 404, to_json_error("Page Not Found")) end

  defp send_bad_request(conn) do send_resp(conn, 400, to_json_error("Bad Request")) end

  defp send_conflict(conn) do send_resp(conn, 409, to_json_error("Conflict")) end

  defp parse_body_string(conn) do
    case Plug.Conn.read_body(conn) do
      {:ok, data, _conn} -> case Poison.decode(data) do
        {:ok, value} -> {:ok, value}
        {:error, error} -> {:error, error}
      end
      {:error, error} -> {:error, error}
    end
  end
end
