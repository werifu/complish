source __get_cmd_chain.zsh

function should_succ() {
  local parsed=$(__get_cmd_chain ${1})
  if [[ ! $parsed = ${2} ]]; then
    print -P "%F{red}Fail(should equal):\n  ${1} => $parsed\n  ${2} %F{reset}"
    return 1
  fi
  return 0
}

function should_fail() {
  local parsed=$(__get_cmd_chain ${1})
  if [[ $parsed = ${2} ]]; then
    print -P "%F{red}Fail(should not equal):\n  ${1} => $parsed\n  ${2} %F{reset}"
    return 1
  fi
  return 0
}


should_succ "cmd sub1 subsub1 -f file" "cmd sub1 subsub1"
should_succ "cmd sub1 subsub1 -f file" "cmd sub1 subsub1"
should_succ "cmd -log     " "cmd"
should_succ "cmd sub1    sub2 -f" "cmd sub1 sub2"

# no space at the last, regard it as in progress
should_succ "cmd sub1" "cmd"
should_succ "cmd sub1 sub" "cmd sub1"
should_succ "cmd sub1 " "cmd sub1"
should_succ "cmd sub1 sub " "cmd sub1 sub"

should_fail "cmd sub1 subsub1 another -h" "cmd sub1 subsub1"