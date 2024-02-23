defmodule TheFirstPlug do
  use TheCreator

  my_error code: 404, content: "Tu n'as rien à faire ici!"

  my_get "/" do
    {200, "Welcome to the new world of Plugs! aaaaaaa"}
  end

  my_get "/me" do
    {200, "You are the Second One. bbbbbbb"}
  end
end
