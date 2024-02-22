defmodule Part6Test do
  use ExUnit.Case
  doctest Part6

  test "reject bad requests" do
    assert GenServer.call(Database, "useless because of bad_request") == :bad_request
  end

  test "reject bad method" do
    assert GenServer.call(Database, {:wrong_method, "useless because of bad_method"}) == :bad_method
  end

  test "key not found" do
    assert Database.get "key1" == :not_found
    assert Database.put "key1", "useless because of not_found" == :not_found
    assert Database.delete "key1" == :not_found
  end

  test "create" do
    assert Database.post "key1", "my new data yay!" == {:created, "my new data yay!"}
  end

  test "already exists" do
    Database.post "key1", "my new data yay!"
    assert Database.post "key1", "useless because of already_exists" == :already_exists
  end

  test "read" do
    Database.post "key1", "my new data yay!"
    assert Database.get "key1" == {:ok, "my new data yay!"}
  end

  test "update" do
    Database.post "key1", "my new data yay!"
    assert Database.put "key1", "the data changed!" == {:updated, "the data changed!"}
  end

  test "read after update" do
    Database.post "key1", "my new data yay!"
    Database.put "key1", "the data changed!"
    assert Database.get "key1" == {:ok, "the data changed!"}
  end

  test "delete" do
    Database.post "key1", "my new data yay!"
    Database.put "key1", "the data changed!"
    assert Database.delete "key1" == :deleted
  end

  test "not found after delete" do
    Database.post "key1", "my new data yay!"
    Database.put "key1", "the data changed!"
    Database.delete "key1"
    assert Database.get "key1" == :not_found
    assert Database.put "key1", "useless because of not_found" == :not_found
    assert Database.delete "key1" == :not_found
  end

  test "create after delete" do
    Database.post "key1", "my new data yay!"
    Database.put "key1", "the data changed!"
    Database.delete "key1"
    assert Database.post "key1", "the data is back!" == {:created, "the data is back!"}
  end

end
