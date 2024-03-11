defmodule Riak do
  def url, do: "https://kbrw-sb-tutoex-riak-gateway.kbrw.fr"
  def bucket, do: "adrgaspard_orders"

  def auth_header do
    username = "sophomore"
    password = "jlessthan3tutoex"
    auth = :base64.encode_to_string("#{username}:#{password}")
    [{'authorization', 'Basic #{auth}'}]
  end

  def put(key, object) do
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:put, {'#{Riak.url}/buckets/#{Riak.bucket}/keys/#{key}', Riak.auth_header(), 'application/json', object}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 -> {:ok, {code, body}}
      code -> {:error, {code, body}}
    end
  end

  def list_buckets do
    {:ok, {{_, 200, _message}, _headers, body}} = :httpc.request(:get, {'#{Riak.url}/buckets?buckets=true', Riak.auth_header()}, [], [])
    {:ok, body}
  end

  def list_keys do
    {:ok, {{_, 200, _message}, _headers, body}} = :httpc.request(:get, {'#{Riak.url}/buckets/#{Riak.bucket}/keys?keys=true', Riak.auth_header()}, [], [])
    {:ok, body}
  end

  def get(key) do
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:get, {'#{Riak.url}/buckets/#{Riak.bucket}/keys/#{key}', Riak.auth_header()}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 -> {:ok, {code, Poison.decode!(body)}}
      code -> {:error, {code, body}}
  end

  def delete(key) do
    {:ok, {{_, code, _message}, _headers, body}} = :httpc.request(:delete, {'#{Riak.url}/buckets/#{Riak.bucket}/keys/#{key}', Riak.auth_header()}, [], [])
    case code do
      code when is_number(code) and code >= 200 and code < 400 -> {:ok, {code, body}}
      code -> {:error, {code, body}}
    end
  end
end
