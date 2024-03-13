defmodule Riak do
  def url, do: "https://kbrw-sb-tutoex-riak-gateway.kbrw.fr"
  def orders_bucket, do: "adrgaspard_orders"
  def orders_index_name, do: "adrgaspard_orders_index"
  def orders_schema_name, do: "adrgaspard_orders_schema"
  def orders_schema_path, do: "./schemas/order_schema.xml"

  def auth_header do
    username = "sophomore"
    password = "jlessthan3tutoex"
    auth = :base64.encode_to_string("#{username}:#{password}")
    [{'authorization', 'Basic #{auth}'}]
  end

  def get(bucket_name, key) do
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:get, {'#{Riak.url}/buckets/#{bucket_name}/keys/#{key}', Riak.auth_header()}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 -> {:ok, {code, Poison.decode!(body)}}
      code -> {:err, {code, body}}
    end
  end

  def put(bucket_name, key, object) do
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:put, {'#{Riak.url}/buckets/#{bucket_name}/keys/#{key}', Riak.auth_header(), 'application/json', object}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 -> {:ok, {code, body}}
      code -> {:err, {code, body}}
    end
  end

  def delete(bucket_name, key) do
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:delete, {'#{Riak.url}/buckets/#{bucket_name}/keys/#{key}', Riak.auth_header()}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 -> {:ok, {code, body}}
      code -> {:err, {code, body}}
    end
  end

  def get_buckets do
    {:ok, {{_, 200, _message}, _headers, body}} = :httpc.request(:get, {'#{Riak.url}/buckets?buckets=true', Riak.auth_header()}, [], [])
    {:ok, body}
  end

  def clear_bucket(bucket_name) do
    keys = Poison.decode!(elem(Riak.get_keys(bucket_name), 1))["keys"]
    task = Task.async_stream(keys, fn item -> Riak.delete(bucket_name, item) end)
    Stream.run(task)
    {:ok}
  end

  def delete_bucket(bucket_name) do
    Riak.clear_bucket(bucket_name)
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:delete, {'#{Riak.url}/buckets/#{bucket_name}/props', Riak.auth_header()}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 -> {:ok, {code, body}}
      code -> {:err, {code, body}}
    end
  end

  def get_keys(bucket_name) do
    {:ok, {{_, 200, _message}, _headers, body}} = :httpc.request(:get, {'#{Riak.url}/buckets/#{bucket_name}/keys?keys=true', Riak.auth_header()}, [], [])
    {:ok, body}
  end

  def get_schema(schema_name) do
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:get, {'#{Riak.url}/search/schema/#{schema_name}', Riak.auth_header()}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 -> {:ok, {code, body}}
      code -> {:err, {code, body}}
    end
  end

  def put_schema(schema_name, schema_path) do
    schema = File.read!(schema_path)
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:put, {'#{Riak.url}/search/schema/#{schema_name}', Riak.auth_header(), 'application/xml', schema}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 -> {:ok, {code, body}}
      code -> {:err, {code, body}}
    end
  end

  def get_indexes() do
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:get, {'#{Riak.url}/search/index', Riak.auth_header()}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 -> {:ok, {code, body}}
      code -> {:err, {code, body}}
    end
  end

  def put_index(index_name, schema_name) do
    content = "{\"schema\": \"#{schema_name}\"}"
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:put, {'#{Riak.url}/search/index/#{index_name}', Riak.auth_header(), 'application/json', content}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 -> {:ok, {code, body}}
      code -> {:err, {code, body}}
    end
  end

  def assign_index(index_name, bucket_name) do
    object = "{\"props\": {\"search_index\": \"#{index_name}\"}}"
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:put, {'#{Riak.url}/buckets/#{bucket_name}/props', Riak.auth_header(), 'application/json', object}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 -> {:ok, {code, body}}
      code -> {:err, {code, body}}
    end
  end

  def search(index, query, page, rows, sort) do
    page = case page do
      nil -> 0
      value -> value
    end
    rows = case rows do
      nil -> 30
      value -> value
    end
    sort = case sort do
      nil -> "creation_date_index"
      value -> value
    end
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:get, {'#{Riak.url}/search/query/#{index}/?wt=json&q=#{query}&start=#{page}&rows=#{rows}&sort=#{sort}%20ASC', Riak.auth_header()}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 ->
        parsed_body = Poison.decode!(body)
        {:ok, {code, parsed_body["response"]}}
      code -> {:err, {code, body}}
    end
  end

  def escape(string) do
    string = String.replace string, "+", "\\+"
    string = String.replace string, "-", "\\-"
    string = String.replace string, "&&", "\\&\\&"
    string = String.replace string, "||", "\\|\\|"
    string = String.replace string, "!", "\\!"
    string = String.replace string, "(", "\\("
    string = String.replace string, ")", "\\)"
    string = String.replace string, "{", "\\{"
    string = String.replace string, "}", "\\}"
    string = String.replace string, "[", "\\["
    string = String.replace string, "]", "\\]"
    string = String.replace string, "^", "\\^"
    string = String.replace string, "\"", "\\\""
    string = String.replace string, "~", "\\~"
    string = String.replace string, "*", "\\*"
    string = String.replace string, "?", "\\?"
    string = String.replace string, ":", "\\:"
    string = String.replace string, "/", "\\/"
    String.replace string, "\\", "%5C"
  end
end
