defmodule MyApp.MixProject do
  use Mix.Project

  def project do
    [
      app: :myapp,
      version: "0.1.0",
      elixir: "~> 1.11",
      start_permanent: Mix.env() == :prod,
      deps: deps(),
      compilers: [:reaxt_webpack] ++ Mix.compilers()
    ]
  end

  # Run "mix help compile.app" to learn about applications.
  def application do
    [
      mod: {MyApp, []},
      extra_applications: [:logger, :inets, :ssl, :ewebmachine, :cowboy]
    ]
  end

  # Run "mix help deps" to learn about dependencies.
  defp deps do
    [
      {:reaxt, tag: "v4.0.2", github: "kbrw/reaxt"},
      {:poison, "~> 4.0"},
      {:exfsm, git: "https://github.com/kbrw/exfsm.git"},
      {:plug, "~> 1.10.0"},
      {:plug_cowboy, "~> 1.0.0"},
      {:ewebmachine, "~> 2.2.0"}
    ]
  end
end
