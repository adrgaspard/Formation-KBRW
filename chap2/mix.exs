defmodule Chap2.MixProject do
  use Mix.Project

  def project do
    [
      app: :chap2,
      version: "0.1.0",
      elixir: "~> 1.11",
      start_permanent: Mix.env() == :prod,
      deps: deps()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      mod: {Chap2, []},
      extra_applications: [:logger]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:poison, "~> 4.0"},
      {:plug_cowboy, "~> 2.4"}
    ]
  end
end
