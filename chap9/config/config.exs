use Mix.Config

config :reaxt, [
  otp_app: :myapp,
  hot: false,
  pool_size: 3,
  global_config: %{}
]
