defmodule HelloErrorRoutes do
  use Ewebmachine.Builder.Resources ; resources_plugs
  resource "/error/:status" do %{s: elem(Integer.parse(status), 0)} after
    content_types_provided do: ['text/html': :to_html, 'application/json': :to_json]
    defh to_html, do: "<h1> Error ! : '#{Ewebmachine.Core.Utils.http_label(state.s)}'</h1>"
    defh to_json, do: ~s/{"error": #{state.s}, "label": "#{Ewebmachine.Core.Utils.http_label(state.s)}"}/
    finish_request do: {:halt, state.s}
  end
end

defmodule EwebHelloRouter do
  use Ewebmachine.Builder.Resources

  if Mix.env == :dev, do: plug Ewebmachine.Plug.Debug
  plug :resource_match
  plug Ewebmachine.Plug.Run
  plug Ewebmachine.Plug.Send

  resources_plugs error_forwarding: "/error/:status", nomatch_404: true
  plug HelloErrorRoutes

  resource "/hello/:name" do %{name: name} after
    content_types_provided do: ['text/html': :to_html]
    defh to_html, do: "<html><h1>Hello #{state.name}</h1></html>"
  end
end
