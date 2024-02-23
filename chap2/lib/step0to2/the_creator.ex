defmodule TheCreator do
  @doc false
  defmacro __using__(_opts) do
    quote do
      import Plug.Conn
      import TheCreator
      @get_routes []
      @not_found_response_code 404
      @not_found_response_data "Not found"
      @before_compile TheCreator
    end
  end

  defmacro my_error(options) do
    quote do
      @not_found_response_code unquote(options[:code])
      @not_found_response_data unquote(options[:content])
    end
  end

  defmacro my_get(route, do: block) do
    function_name = String.to_atom("route get " <> route)
    quote do
      @get_routes [%{:method => :get, :url => unquote(route), :function => unquote(function_name)} | @get_routes]
      def unquote(function_name)(), do: unquote(block)
    end
  end

  @doc false
  defmacro __before_compile__(_env) do
    quote do
      def init(options) do options end
      def call(connection, _options) do
        {response_code, response_data} = case Enum.find(@get_routes, fn item ->
          item[:method] == String.to_atom(String.downcase(connection.method)) and item[:url] == connection.request_path
        end) do
          nil -> {@not_found_response_code, @not_found_response_data}
          route -> {response_code, response_data} = apply(__MODULE__, route[:function], [])
        end
        connection
        |> put_resp_content_type("text/plain")
        |> send_resp(response_code, response_data)
      end
    end
  end
end
