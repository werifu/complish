function __get_cmd_chain() {
  local cmd_chain=()
  local chain_str=${1}

  local args=(${(s: :)chain_str})
  
  for arg in $args; do
    if [[ $arg[1] == "-" ]]; then
      echo $cmd_chain
      return
    fi
    cmd_chain+=($arg)
  done

  # "cmd sub1" should be parsed "cmd" because the command chain may not finish
  # eg. "cmd su" would not work if it's parsed to ("cmd" "su")
  if [[ $chain_str[-1] == " " ]]; then
    echo $cmd_chain
  else
    echo $cmd_chain[1,-2]
  fi
}


